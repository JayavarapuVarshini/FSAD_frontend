// components/Analytics.js
import React from 'react';

const Analytics = ({ forms, responses }) => {
  // Calculate analytics
  const totalForms = forms.length;
  const activeForms = forms.filter(f => f.status === 'active').length;
  const totalResponses = responses.length;
  const avgResponsesPerForm = (totalResponses / totalForms).toFixed(1);
  
  // Calculate average rating
  const totalRating = responses.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = (totalRating / totalResponses).toFixed(2) || '0.00';
  
  // Calculate completion rate (estimated based on responses)
  const completionRate = ((totalResponses / (totalForms * 10)) * 100).toFixed(0);

  // Generate last 7 days data
  const last7Days = ['Feb 15', 'Feb 16', 'Feb 17', 'Feb 18', 'Feb 19', 'Feb 20', 'Feb 21'];
  const trendData = last7Days.map(day => {
    return responses.filter(r => {
      const responseDate = new Date(r.date);
      const dayDate = new Date(day + ', 2024');
      return responseDate.toDateString() === dayDate.toDateString();
    }).length;
  });

  // Course response data
  const courseData = forms.map(form => ({
    name: form.course,
    responses: form.responses,
    rating: responses.filter(r => r.formId === form.id)
      .reduce((sum, r) => sum + r.rating, 0) / (responses.filter(r => r.formId === form.id).length || 1)
  }));

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Analytics Overview</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalForms}</div>
          <div className="stat-label">Total Forms</div>
          <div className="stat-sub">{activeForms} active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalResponses}</div>
          <div className="stat-label">Total Responses</div>
          <div className="stat-sub">{avgResponsesPerForm} avg per form</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgRating}</div>
          <div className="stat-label">Avg Rating</div>
          <div className="stat-sub">out of 5.00</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
          <div className="stat-sub">estimated</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Response Trend (Last 7 Days)</h3>
          <div className="chart-placeholder">
            {trendData.map((value, index) => (
              <div key={index} className="bar-container">
                <div 
                  className="bar" 
                  style={{ height: `${(value / Math.max(...trendData, 1)) * 200}px` }}
                ></div>
                <span className="bar-label">{last7Days[index].split(' ')[1]}</span>
              </div>
            ))}
          </div>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color blue"></span>
              <span>Responses</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Courses by Responses</h3>
          <div className="chart-placeholder">
            {courseData.slice(0, 5).map((course, index) => (
              <div key={index} className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(course.responses / Math.max(...courseData.map(c => c.responses), 1)) * 200}px`,
                    background: index === 0 ? '#10b981' : '#3b82f6'
                  }}
                ></div>
                <span className="bar-label">{course.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color green"></span>
              <span>Responses</span>
            </div>
            <div className="legend-item">
              <span className="legend-color orange"></span>
              <span>Avg Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-feedback">
        <h3>Recent Feedback Summary</h3>
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Form Title</th>
              <th>Course</th>
              <th>Instructor</th>
              <th>Responses</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id}>
                <td>{form.title}</td>
                <td>{form.course}</td>
                <td>{form.instructor}</td>
                <td>{form.responses}</td>
                <td>
                  <span className={`status-active ${form.status}`}>
                    {form.status === 'active' ? 'active' : 'inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;