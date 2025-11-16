import React from 'react';
import './EventSlider.css';
import posterImage from '../assets/poster_1.png';
import posterSecondaryImage from '../assets/poster_2.png';
import crestLogo from '../assets/Trophic.png';

const EventSlider = ({ events }) => {
  return (
    <div className="event-banner">
      <div className="event-stack">
        <div className="event-poster event-poster-top ">
          <img src={posterImage} alt="Navaspurthi 2025 Poster" />
        </div>
        <div className="event-slider-wrapper">
          <div className="event-slider-ring" aria-hidden="true"></div>
          <div className="event-centerpiece" aria-hidden="true">
            <img src={crestLogo} alt="Navaspurthi crest centerpiece" loading="lazy" />
          </div>
          <div className="event-slider" style={{ '--quantity': events.length }}>
            {events.map((event, index) => (
              <div
                key={event.id}
                className="event-item"
                style={{ '--position': index + 1 }}
                onClick={() => event.onClick && event.onClick(event)}
              >
                <div className="event-card">
                  <img src={event.image} alt={event.title} />
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    {event.category && <p>{event.category}</p>}
                    <div className="event-glow"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="event-poster event-poster-bottom ">
          <img src={posterSecondaryImage} alt="Navaspurthi 2025 Highlight Poster" />
        </div>
      </div>
    </div>
  );
};

export default EventSlider;
