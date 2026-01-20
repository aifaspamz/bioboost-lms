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