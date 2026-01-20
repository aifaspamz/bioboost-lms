import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient";
import Navigation from "../components/Navigation";

import '../styles/learning-hub-view.css';

export default function LearningHub() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const { role, username } = useContext(AuthContext);

  const navigate = useNavigate();

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, lessonId) => {
    e.stopPropagation();
    navigate(`/edit-lesson/${lessonId}`);
  };

  const handleDelete = async (e, lessonId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', lessonId);

        if (error) throw error;
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      } catch (error) {
        console.error("Error deleting lesson:", error.message);
        alert('Failed to delete lesson');
      }
    }
  };
  
  useEffect(() => {
    fetchLessons();
  }, []);

  if(loading) return <div>Loading</div>;  

  return (
    <div className="container">
      <Navigation />
      
      <div className="row">
        <h1 className="profile-title">LEARNING HUB</h1>
      </div>

      <div className="lesson-grid">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id} 
            className="card classroom-card" 
            onClick={() => navigate(`/learning/${lesson.id}`)}
          >

            <div className="card-banner" style={{ backgroundColor: lesson.theme_color }}>
              <h2>{lesson.title}</h2>
              <p className="small">{lesson.subject}</p>
              
              <div className="level-dot active card-avatar">
                T
              </div>
            </div>

            <div className="card-info">
              <span className="small" style={{ fontWeight: '800' }}>{lesson.teacher_name}</span>
              
              {role === "teacher" && (
                <div className="card-actions">
                  <button 
                    className="btn btn-sm" 
                    onClick={(e) => handleEdit(e, lesson.id)}
                    title="Edit Lesson"
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={(e) => handleDelete(e, lesson.id)}
                    title="Delete Lesson"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {role === "teacher"
        ? (
          <div className="fab-container">
            <button 
              className="fab-button" 
              onClick={() => navigate('/new-lesson')}
              title="Create New Lesson"
            >
              +
            </button>
          </div>
        )
        : ''
        }
      </div>
    </div>
  );
}