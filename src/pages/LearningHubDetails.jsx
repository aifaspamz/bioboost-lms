import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation";

import { supabase } from "../supabaseClient";

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

export default function LearningHubDetails() {
  const { id } = useParams(); // Grabs the ID from the URL
  const [lesson, setLesson] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullLesson = async () => {
      setLoading(true);

      // LESSONS
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      const { data: blocksData } = await supabase
        .from('lesson_blocks')
        .select('*')
        .eq('lesson_id', id)
        .order('order_index', { ascending: true });

      setLesson(lessonData);
      setBlocks(blocksData || []);
      setLoading(false);
    }

    fetchFullLesson();
  }, [id]);

  if (loading) return <div>Loading Lesson...</div>;
  if (!lesson) return <div>Lesson not found.</div>;

  return (
    <div className="container">
      <Navigation />

      {/* ================= DISCUSSION (TOP) ================= */}
      <div className="card">
        <h1>{lesson.title}</h1>
        <p className="small">
          {lesson.subject}
        </p>
      </div>

      <div className="card discussion-section">
        <div className="row">
          <h2>Discussion</h2>
          {/* <span className="badge">{lesson.subject}</span> */}
        </div>

        <div className="discussion-block">
          {blocks.map((block, i) => (
            <div key={block.id} className="card discussion-card">
              {block.block_title && <h3>{block.block_title}</h3>}

              {block.block_image_url && (
                <img
                  src={block.block_image_url}
                  alt={block.block_title || "Lesson image"}
                  className="discussion-img"
                />
              )}

              {block.block_video_url && (
                <video controls className="lesson-video">
                  <source src={block.block_video_url} />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Feature: Display external video URL using iframe for YouTube and embedded video players */}
              {block.block_external_video_url && (
                <div style={{ marginTop: '10px' }}>
                  <iframe
                    width="100%"
                    height="400"
                    src={convertToEmbedUrl(block.block_external_video_url)}
                    title={block.block_title || "Lesson Video"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="lesson-video"
                  />
                  {/* Debug: Show the actual URL being used */}
                  {/* <p style={{fontSize: '0.8em', color: '#999', marginTop: '5px'}}>URL: {convertToEmbedUrl(block.block_external_video_url)}</p> */}
                </div>
              )}

              <pre className="discussion-text">{block.block_text}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* ================= TEACHER LESSONS ================= */}
      {/* <div className="card">
        <h2>Teacher Added Lessons</h2>
        <div className="lesson-list">
          {teacherLessons.map((l) => (
            <div key={l.id} className="lesson-item">
              <div>
                <div className="lesson-title">{l.title}</div>
                <div className="lesson-sub small">
                  By {l.teacher} • {l.type.toUpperCase()}
                </div>
              </div>
              <a className="btn" href={l.url}>Open</a>
            </div>
          ))}
        </div>
      </div> */}

      
    </div>
  );
}
