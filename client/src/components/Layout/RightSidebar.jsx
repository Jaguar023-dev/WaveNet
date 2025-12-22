import React, { useState } from 'react';
import { Users, Calendar, Video, MessageCircle, Plus, MoreHorizontal } from 'react-feather';
import './RightSidebar.css';

const RightSidebar = () => {
  const [sponsoredVisible, setSponsoredVisible] = useState(true);

  const birthdays = [
    { name: 'Alex Johnson', today: true },
    { name: 'Sam Wilson', today: false, days: 2 },
    { name: 'Taylor Swift', today: false, days: 3 },
  ];

  const contacts = [
    { name: 'Chris Evans', online: true },
    { name: 'Emma Watson', online: true },
    { name: 'John Doe', online: false },
    { name: 'Jane Smith', online: true },
    { name: 'Mike Ross', online: false },
  ];

  const sponsored = [
    { title: 'Learn React', company: 'Tech Academy' },
    { title: 'Premium Headphones', company: 'AudioTech' },
    { title: 'Travel Deals', company: 'Wanderlust' },
  ];

  return (
    <div className="right-sidebar">
      {/* Birthdays */}
      <div className="sidebar-section">
        <div className="section-header">
          <h3>
            <Calendar size={20} />
            <span>Birthdays</span>
          </h3>
        </div>
        <div className="birthdays-list">
          {birthdays.map((birthday, index) => (
            <div key={index} className="birthday-item">
              <div className="birthday-icon">🎂</div>
              <div className="birthday-info">
                <span className="birthday-name">{birthday.name}</span>
                <span className="birthday-date">
                  {birthday.today ? 'Today' : `in ${birthday.days} days`}
                </span>
              </div>
              <button className="birthday-wish-btn">🎉 Wish</button>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsored */}
      {sponsoredVisible && (
        <div className="sidebar-section">
          <div className="section-header">
            <h3>Sponsored</h3>
            <button 
              className="hide-btn"
              onClick={() => setSponsoredVisible(false)}
            >
              Hide
            </button>
          </div>
          <div className="sponsored-list">
            {sponsored.map((item, index) => (
              <div key={index} className="sponsored-item">
                <div className="sponsored-image"></div>
                <div className="sponsored-info">
                  <span className="sponsored-title">{item.title}</span>
                  <span className="sponsored-company">{item.company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts */}
      <div className="sidebar-section">
        <div className="section-header">
          <h3>
            <Users size={20} />
            <span>Contacts</span>
          </h3>
          <div className="contact-actions">
            <button className="contact-action-btn">
              <Video size={18} />
            </button>
            <button className="contact-action-btn">
              <MessageCircle size={18} />
            </button>
            <button className="contact-action-btn">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
        <div className="contacts-list">
          {contacts.map((contact, index) => (
            <div key={index} className="contact-item">
              <div className="contact-avatar">
                <div className={`status-indicator ${contact.online ? 'online' : 'offline'}`} />
              </div>
              <span className="contact-name">{contact.name}</span>
            </div>
          ))}
          <button className="see-all-contacts">
            <Users size={16} />
            <span>See all</span>
          </button>
        </div>
      </div>

      {/* Create Room */}
      <div className="create-room">
        <button className="create-room-btn">
          <Plus size={20} />
          <span>Create Room</span>
        </button>
      </div>

      {/* Groups You Might Like */}
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Groups You Might Like</h3>
        </div>
        <div className="groups-suggestions">
          {['React Developers', 'Web Design', 'Startup Founders', 'Photography'].map((group, index) => (
            <div key={index} className="group-suggestion">
              <div className="group-icon">👥</div>
              <div className="group-info">
                <span className="group-name">{group}</span>
                <span className="group-members">12.5K members</span>
              </div>
              <button className="join-group-btn">Join</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;