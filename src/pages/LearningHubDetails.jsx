import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation";

import { supabase } from "../supabaseClient";

export default function LearningHubDetails() {
  const { lessonId } = useParams(); // Grabs the ID from the URL
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
        .eq('id', lessonId)
        .single();

      const { data: blocksData } = await supabase
        .from('lesson_blocks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      setLesson(lessonData);
      setBlocks(blocksData || []);
      setLoading(false);
    }

    fetchFullLesson();
  }, [lessonId]);

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
