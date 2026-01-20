import React, { useState, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Navigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { AuthContext } from '../../contexts/AuthContext';

import '../../styles/create-lesson.css';

export default function CreateLesson() {
  const navigate = useNavigate();
  const { username, role, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const [lessonInfo, setLessonInfo] = useState({
    title: '',
    subject: '',
    theme_color: 'var(--bg3)',
    reference_file: null
  });

  const [blocks, setBlocks] = useState([
    { id: Date.now(), block_title: '', block_text: '', image_file: null }
  ]);

  const addBlock = () => {
    setBlocks([...blocks, { id: Date.now(), block_title: '', block_text: '', image_file: null }]);
  };

  const removeBlock = (index) => {
    if (blocks.length > 1) {
      const newBlocks = blocks.filter((_, i) => i !== index);
      setBlocks(newBlocks);
    } else {
      alert("A lesson must have at least one block.");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // UPLOAD YUNG REFERENCE URL
      let referenceUrl = null;
      if (lessonInfo.reference_file) {
        const fileName = `${Date.now()}_${lessonInfo.reference_file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reference-files')
          .upload(fileName, lessonInfo.reference_file);

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('reference-files').getPublicUrl(uploadData.path);
        referenceUrl = publicUrl;
      }

      // ADD SA LESSON DATABASE
      const { data: newLesson, error: lessonError } = await supabase
        .from('lessons')
        .insert([{
          teacher_id: user.id,
          teacher_name: username,
          title: lessonInfo.title,
          subject: lessonInfo.subject,
          reference_file_url: referenceUrl,
          reference_file_name: lessonInfo.reference_file !== null ? lessonInfo.reference_file.name : null,
          theme_color: 'var(--accent)' 
        }])
        .select()
        .single();

      if (lessonError) throw lessonError;
      
      // SAVES UNG MGA LESSON BLOCKS
      const blockData = await Promise.all(blocks.map(async (block, index) => {
        let blockImageUrl = null;

        if (block.image_file) {
          const imgName = `${Date.now()}_block_${index}`;
          const { data: imgUpload, error: imgError } = await supabase.storage
            .from('lesson-images')
            .upload(imgName, block.image_file);

          if (imgError) throw imgError;
          const { data: { publicUrl } } = supabase.storage.from('lesson-images').getPublicUrl(imgUpload.path);
          blockImageUrl = publicUrl;
        }

        return {
          lesson_id: newLesson.id,
          order_index: index,
          block_title: block.block_title,
          block_text: block.block_text,
          block_image_url: blockImageUrl
        };
      }));

      const { error: blocksError } = await supabase
        .from('lesson_blocks')
        .insert(blockData);

      if (blocksError) throw blocksError;

      setLoading(false);
      navigate('/learning');
    } catch(err) {
      console.error(err);
      alert("Error saving lesson: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (role === 'student') {
    return <Navigate to="/learning" replace />;
  }

  return (
    <div className="container">
      <Navigation />
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="profile-title">CREATE NEW LESSON</h1>
        <button className="btn" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Publish Lesson'}
        </button>
      </div>

      {/* Main Lesson Info */}
      <div className="card">
        <input 
          className="input-field" 
          placeholder="Lesson Title (e.g. Krebs Cycle)" 
          onChange={(e) => setLessonInfo({...lessonInfo, title: e.target.value})}
        />
        <input 
          className="input-field" 
          placeholder="Subject (e.g. Biology)" 
          onChange={(e) => setLessonInfo({...lessonInfo, subject: e.target.value})}
        />
        <label className="small">Reference PDF (Optional):</label>
        <input type="file" onChange={(e) => setLessonInfo({...lessonInfo, reference_file: e.target.files[0]})} />
      </div>

      <h2 className="small" style={{ margin: '20px 0' }}>LESSON CONTENT BLOCKS</h2>

      {/* Dynamic Blocks */}
      {blocks.map((block, index) => (
        // style={{ borderLeft: '4px solid var(--accent)' }}
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
            onChange={(e) => {
              const newBlocks = [...blocks];
              newBlocks[index].block_text = e.target.value;
              setBlocks(newBlocks);
            }}
          />
          <label className="small">Section Image (Optional):</label>
          <input type="file" onChange={(e) => {
            const newBlocks = [...blocks];
            newBlocks[index].image_file = e.target.files[0];
            setBlocks(newBlocks);
          }} />
        </div>
      ))}

      <button className="btn lesson-btn" onClick={addBlock} style={{ marginBottom: '50px' }}>
        + Add Another Section
      </button>
    </div>
  );
}