import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { EVENT_LIST } from '../data/eventsConfig';

const DAY_METADATA = {
  day1: { id: 'day1', label: 'Day 1', date: 'November 27, 2025' },
  day2: { id: 'day2', label: 'Day 2', date: 'November 28, 2025' }
};

const BASE_SCHEDULE = {
  day1: [
    { time: '8:30 AM', event: 'Gates Open & Registration Desk', venue: 'Main Entrance', type: 'general', summary: 'Collect welcome kits and confirm participant check-in.' },
    { time: '10:00 AM', event: 'Opening Ceremony', venue: 'Main Auditorium', type: 'ceremony', summary: 'Inauguration with chief guests, lighting of the lamp, and festival overview.' },
    { time: '6:30 PM', event: 'DJ Night', venue: 'Main Ground', type: 'entertainment', summary: 'High-energy DJ set to wrap up Day 1 celebrations.' }
  ],
  day2: [
    { time: '8:00 AM', event: 'Breakfast Networking', venue: 'Food Court', type: 'general', summary: 'Grab breakfast and meet fellow participants.' },
    { time: '1:00 PM', event: 'Industry Connect: Innovation Expo', venue: 'Innovation Hub', type: 'technical', summary: 'Partner showcases and sponsor booths highlighting cutting-edge tech.' },
    { time: '4:30 PM', event: 'Awards & Felicitation Ceremony', venue: 'Main Auditorium', type: 'ceremony', summary: 'Top teams and performers receive accolades and prizes.' },
    { time: '6:00 PM', event: 'Closing Ceremony & Vote of Thanks', venue: 'Main Auditorium', type: 'ceremony', summary: 'Fest wrap-up with snapshots of Navaspurthi 2025.' }
  ]
};

const typePaletteMap = {
  technical: 'from-gold to-gold-light',
  cultural: 'from-burgundy to-maroon',
  gaming: 'from-gold-light to-gold',
  workshop: 'from-maroon to-burgundy',
  ceremony: 'from-gold to-burgundy-light',
  entertainment: 'from-burgundy-light to-maroon',
  general: 'from-gold to-gold-light',
  solo: 'from-purple-500 to-pink-500',
  group: 'from-blue-500 to-cyan-500',
  exception: 'from-amber-500 to-rose-500'
};

const getEventTypeColor = (type) => typePaletteMap[type] || 'from-gold to-gold-light';

const parseTimeToMinutes = (timeString) => {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let [_, hourStr, minuteStr, period] = match;
  let hour = parseInt(hourStr, 10) % 12;
  if (period.toUpperCase() === 'PM') {
    hour += 12;
  }
  const minutes = parseInt(minuteStr, 10);
  return hour * 60 + minutes;
};

const buildScheduleData = () => {
  const byDay = {
    day1: [...(BASE_SCHEDULE.day1 || [])],
    day2: [...(BASE_SCHEDULE.day2 || [])]
  };

  EVENT_LIST.filter((event) => event.schedule).forEach((event) => {
    const { dayId, time, venue } = event.schedule;
    if (!dayId) return;
    if (!byDay[dayId]) {
      byDay[dayId] = [];
    }
    byDay[dayId].push({
      time,
      event: event.name,
      venue,
      type: event.exception ? 'exception' : event.category,
      summary: event.summary
    });
  });

  Object.keys(byDay).forEach((dayId) => {
    byDay[dayId].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  });

  return byDay;
};

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState('day1');

  const scheduleData = useMemo(() => buildScheduleData(), []);

  const days = useMemo(() => {
    return Object.keys(scheduleData)
      .filter((dayId) => scheduleData[dayId]?.length)
      .map((dayId) => DAY_METADATA[dayId])
      .filter(Boolean);
  }, [scheduleData]);

  const activeDay = days.find((day) => day.id === selectedDay)?.id ? selectedDay : days[0]?.id;

  const getTypeLabel = (type) => {
    if (type === 'solo') return 'Solo Event';
    if (type === 'group') return 'Group Event';
    if (type === 'exception') return 'Special Showcase';
    if (type === 'general') return 'Festival Experience';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-14 md:pt-12 pb-12">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-5"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-orbitron font-bold text-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.35)]">
            Event Schedule
          </h1>
        </motion.div>

        
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 md:gap-10">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`group flex flex-col items-center px-2 pb-1 font-poppins font-semibold uppercase text-xs sm:text-sm transition-all duration-300 border-b-2 min-w-[110px] sm:min-w-[130px] ${
                  activeDay === day.id
                    ? 'text-gold border-gold'
                    : 'text-gold/70 border-transparent hover:text-gold hover:border-gold/60'
                }`}
              >
                <span>{day.label}</span>
                <span className="text-[10px] sm:text-xs text-gold/60 normal-case tracking-normal group-hover:text-gold/80">{day.date}</span>
              </button>
            ))}
          </div>
        </div>

        
        <div className="grid gap-4">
          {scheduleData[activeDay]?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-maroon/80 rounded-2xl p-5 sm:p-6 border border-gold/25 hover:border-transparent hover:shadow-xl hover:shadow-gold/25 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  
                  <div className="md:w-32 flex-shrink-0">
                    <div className="flex items-center gap-2 text-base-white/75">
                      <Clock className="w-4 h-4 text-gold" />
                      <span className="font-semibold font-poppins">{item.time}</span>
                    </div>
                  </div>

                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold font-orbitron text-base-white mb-2 group-hover:text-gold transition-colors">
                      {item.event}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-base-white/70">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gold" />
                        <span>{item.venue}</span>
                      </div>
                      {item.summary && (
                        <span className="hidden sm:inline text-base-white/60">{item.summary}</span>
                      )}
                    </div>
                  </div>

                 
                  <div className="md:w-32 flex-shrink-0 mt-3 md:mt-0">
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getEventTypeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>

                
                <div className={`h-0.5 mt-4 -mx-5 sm:-mx-6 bg-gradient-to-r ${getEventTypeColor(item.type)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        
      </div> */}
    </div>
  );
};

export default Schedule;
