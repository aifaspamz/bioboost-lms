import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { AuthContext } from '../../contexts/AuthContext';

import '../../styles/lesson-editor.css';

// Feature: Helper function to convert various video URLs to embeddable formats
const convertToEmbedUrl = (url) => {
  if (!url) return '';

  // YouTube conversion
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (url.includes('youtube.com/embed/')) return url; // Already in embed format
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Google Drive conversion - handles multiple formats
  if (url.includes('drive.google.com')) {
    // Try to extract file ID from sharing URL
    let fileId = null;
    
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const match1 = url.match(/\/d\/([a-zA-Z0-9-_]+)\//);
    if (match1) fileId = match1[1];
    
    // Format: https://drive.google.com/open?id=FILE_ID
    if (!fileId) {
      const match2 = url.match(/id=([a-zA-Z0-9-_]+)/);
      if (match2) fileId = match2[1];
    }
    
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // Vimeo conversion
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  }

  // Return as-is if already an embed URL or other format
  return url;
};

export default function LessonEditor() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const { username, role, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const [lessonInfo, setLessonInfo] = useState({
    title: '',
    subject: '',
    theme_color: 'var(--bg3)',
    reference_file: null,
    reference_file_url: null,
  });

  const [blocks, setBlocks] = useState([
    { id: Date.now(), block_title: '', block_text: '', image_file: null, video_file: null }
  ]);

  const addBlock = () => {
    setBlocks([...blocks, { id: Date.now(), block_title: '', block_text: '', image_file: null, video_file: null }]);
  };

  const removeBlock = async (index) => {
    const blockToRemove = blocks[index];

    if (blocks.length > 1) {
      // FIX: Improved logic to identify if the block exists in the DB
      // Date.now() generates a 13-digit number. DB IDs are typically much smaller or UUID strings.
      const isRealDbId = blockToRemove.id && (typeof blockToRemove.id === 'string' || blockToRemove.id < 1000000000000);

      if (isEditMode && isRealDbId) {
        const { error } = await supabase.from('lesson_blocks').delete().eq('id', blockToRemove.id);
        if (error) {
          console.error("Delete error:", error.message);
          alert("Failed to delete block from server: " + error.message);
          return;
        }
      }

      const newBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(newBlocks);
    } else {
      alert("A lesson must have at least one block.");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let referenceUrl = lessonInfo.reference_file_url;
      if (lessonInfo.reference_file) {
        const fileName = `${Date.now()}_${lessonInfo.reference_file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reference-files')
          .upload(fileName, lessonInfo.reference_file);

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('reference-files').getPublicUrl(uploadData.path);
        referenceUrl = publicUrl;
      }

      const lessonPayload = {
        teacher_id: user.id,
        teacher_name: username,
        title: lessonInfo.title,
        subject: lessonInfo.subject,
        reference_file_url: referenceUrl,
        reference_file_name: lessonInfo.reference_file ? lessonInfo.reference_file.name : lessonInfo.reference_file_name,
        theme_color: 'var(--accent)' 
      };

      if (isEditMode) lessonPayload.id = id;

      const { data: savedLesson, error: lessonError } = await supabase
        .from('lessons')
        .upsert([lessonPayload])
        .select()
        .single();

      if (lessonError) throw lessonError;
      
      // --- UPSERT BLOCKS ---
      const blockData = await Promise.all(blocks.map(async (block, index) => {
        let blockImageUrl = block.block_image_url;
        let blockVideoUrl = block.block_video_url;
        let blockExternalVideoUrl = block.block_external_video_url || '';

        if (block.image_file) {
          const imgName = `${Date.now()}_img_${index}`;
          const { data: imgUpload, error: imgError } = await supabase.storage.from('lesson-images').upload(imgName, block.image_file);
          if (imgError) throw imgError;
          blockImageUrl = supabase.storage.from('lesson-images').getPublicUrl(imgUpload.path).data.publicUrl;
        }

        if (block.video_file) {
          const vidName = `${Date.now()}_vid_${index}`;
          const { data: vidUpload, error: vidError } = await supabase.storage.from('lesson-images').upload(vidName, block.video_file);
          if (vidError) throw vidError;
          blockVideoUrl = supabase.storage.from('lesson-images').getPublicUrl(vidUpload.path).data.publicUrl;
        }

        if (block.external_video_url) {
          blockExternalVideoUrl = convertToEmbedUrl(block.external_video_url);
        }

        const bPayload = {
          lesson_id: savedLesson.id,
          order_index: index,
          block_title: block.block_title,
          block_text: block.block_text,
          block_image_url: blockImageUrl,
          block_video_url: blockVideoUrl,
          block_external_video_url: blockExternalVideoUrl,
        };

        // FIX: Ensure we include the ID for updates if it is a real database ID
        const isRealDbId = block.id && (typeof block.id === 'string' || block.id < 1000000000000);
        if (isRealDbId) {
           bPayload.id = block.id;
        }

        return bPayload;
      }));

      const { error: blocksError } = await supabase.from('lesson_blocks').upsert(blockData);
      if (blocksError) throw blocksError;

      navigate('/learning');
    } catch(err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!isEditMode)
      return;

    const loadLesson = async () => {
      setLoading(true);

      const { data: lesson, error } = await supabase
        .from("lessons")
        .select(`*, lesson_blocks(*)`)
        .eq('id', id)
        .single();

      if(error) {
        console.error(error);
        alert("Could not find lesson");
        return
      }

      setLessonInfo({
        title: lesson.title,
        subject: lesson.subject,
        theme_color: lesson.theme_color,
        reference_file_url: lesson.reference_file_url,
        reference_file_name: lesson.reference_file_name
      });

      const existingBlocks = lesson.lesson_blocks
        .sort((a, b) => a.order_index - b.order_index)
        .map(b => ({
          id: b.id,
          block_title: b.block_title,
          block_text: b.block_text,
          block_image_url: b.block_image_url,
          block_video_url: b.block_video_url,
          block_external_video_url: b.block_external_video_url || ''
        }));
        
      setBlocks(existingBlocks.length > 0 ? existingBlocks : blocks)
    
      setLoading(false);
    }

    loadLesson();
  }, [id, isEditMode]);

  if (role === 'student') {
    return <Navigate to="/learning" replace />;
  }

  return (
    <div className="container">
      <Navigation />
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="profile-title">{isEditMode ? 'EDIT LESSON' : 'CREATE NEW LESSON'}</h1>
        <button className="btn" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : isEditMode ? 'Update Lesson' : 'Publish Lesson'}
        </button>
      </div>

      <div className="card">
        <input 
          className="input-field" 
          placeholder="Lesson Title (e.g. Krebs Cycle)" 
          value={lessonInfo.title || ''}
          onChange={(e) => setLessonInfo({...lessonInfo, title: e.target.value})}
        />
        <input 
          className="input-field" 
          placeholder="Subject (e.g. Biology)" 
          value={lessonInfo.subject || ''}
          onChange={(e) => setLessonInfo({...lessonInfo, subject: e.target.value})}
        />
        <label className="small">Reference PDF (Optional):</label>
        <input type="file" onChange={(e) => setLessonInfo({...lessonInfo, reference_file: e.target.files[0]})} />
      </div>

      <h2 className="small" style={{ margin: '20px 0' }}>LESSON CONTENT BLOCKS</h2>

      {blocks.map((block, index) => (
        <div key={block.id} className="card">
          <div className="row">
            <span className="level-label">BLOCK #{index + 1}</span>

            <button 
              onClick={() => removeBlock(index)}
              className="remove-block"
              title="Remove Block"
            >
              ×
            </button>

          </div>
          <input 
            className="input-field" 
            placeholder="Section Title (e.g. Importance)" 
            value={block.block_title || ''}
            onChange={(e) => {
              const newBlocks = [...blocks];
              newBlocks[index].block_title = e.target.value;
              setBlocks(newBlocks);
            }}
          />
          <textarea 
            className="input-field" 
            placeholder="Description / Bullet Points" 
            rows="4"
            value={block.block_text || ''}
            onChange={(e) => {
              const newBlocks = [...blocks];
              newBlocks[index].block_text = e.target.value;
              setBlocks(newBlocks);
            }}
          />
          <label className="small">Section Image or Video (Optional):</label>
          <input type="file" onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const newBlocks = [...blocks];
            if(file.type.startsWith('image/'))
              newBlocks[index].image_file = e.target.files[0];
            else if(file.type.startsWith('video/'))
              newBlocks[index].video_file = e.target.files[0];
            setBlocks(newBlocks);
          }} />
          <label className="small">Or paste YouTube/Video URL (Optional):</label>
          <input 
            type="text"
            className="input-field"
            placeholder="e.g., https://www.youtube.com/embed/... or any video URL"
            value={block.external_video_url || block.block_external_video_url || ''}
            onChange={(e) => {
              const newBlocks = [...blocks];
              newBlocks[index].external_video_url = e.target.value;
              setBlocks(newBlocks);
            }}
          />

          <div className="file-preview-container">
            {(block.image_file || block.block_image_url) && !block.video_file && (
              <div className="preview-wrapper">
                <img 
                  src={block.image_file ? URL.createObjectURL(block.image_file) : block.block_image_url} 
                  alt="Preview" 
                  className="preview-media"
                />
              </div>
            )}

            {(block.video_file || block.block_video_url) && !block.image_file && (
              <div className="preview-wrapper">
                <video 
                  controls 
                  key={block.video_file ? URL.createObjectURL(block.video_file) : block.block_video_url}
                  className="preview-media"
                >
                  <source src={block.video_file ? URL.createObjectURL(block.video_file) : block.block_video_url} />
                </video>
              </div>
            )}

            {(block.external_video_url || block.block_external_video_url) && (
              <div className="preview-wrapper">
                <iframe
                  width="100%"
                  height="400"
                  src={convertToEmbedUrl(block.external_video_url || block.block_external_video_url)}
                  title="External Video Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="preview-media"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <button className="btn lesson-btn" onClick={addBlock} style={{ marginBottom: '50px' }}>
        + Add Another Block
      </button>
    </div>
  );
}