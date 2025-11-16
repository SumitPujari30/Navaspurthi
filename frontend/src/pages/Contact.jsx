import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      content: 'KLES BCA PC JABIN SCIENCE COLLEGE HUBLI VIDYANAGAR HUBLI - 560085',
      gradient: 'from-gold to-gold-light'
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 93530 00805',
      gradient: 'from-burgundy to-maroon'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'navaspurthi2025@klebcahubli.in',
      gradient: 'from-gold-light to-gold'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      content: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM',
      gradient: 'from-burgundy-light to-maroon'
    }
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-18 md:pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-orbitron font-bold text-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.35)] mb-3">
            Get In Touch
          </h1>
          <p className="text-base sm:text-lg text-base-white/80 font-poppins max-w-2xl mx-auto">
            We're here to answer your questions and hear your feedback
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-10 sm:space-y-12"
        >
            {/* Contact Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-maroon/80 rounded-2xl p-6 border border-gold/20 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/15 transition-all group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${info.gradient} rounded-xl flex items-center justify-center text-maroon font-semibold mb-4 group-hover:scale-110 transition-transform`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold font-poppins text-gold-light mb-2">{info.title}</h3>
                  <p className="text-sm text-base-white/80 whitespace-pre-line">{info.content}</p>
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <div className="bg-maroon/80 rounded-3xl p-3 sm:p-4 shadow-xl shadow-gold/10 border border-gold/20 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2159.1464847266766!2d75.1221555793668!3d15.367735337746229!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d732e32347e9%3A0x40e5e93edfd10af0!2sKLE%20Society%20PC%20Jabin%20Science%20College!5e0!3m2!1sen!2sin!4v1763232867185!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="rounded-2xl min-h-[260px] sm:min-h-[320px]"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-orbitron text-center text-gold mb-10 sm:mb-12">Frequently Asked Questions</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 max-w-4xl mx-auto px-2 sm:px-0">
            {[
              { q: 'How can I register for events?', a: 'Visit our registration page and fill out the form. You\'ll receive a unique ID and can select your preferred events.' },
              { q: 'Is accommodation provided?', a: 'Yes, we provide accommodation for outstation participants. Contact us for more details.' },
              { q: 'Can I participate in multiple events?', a: 'Absolutely! You can participate in as many events as you like, subject to schedule conflicts.' },
              { q: 'What is the refund policy?', a: 'Registration fees are non-refundable. However, in case of event cancellation, full refund will be provided.' }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-maroon/80 rounded-2xl p-5 sm:p-6 border border-gold/20"
              >
                <h4 className="font-semibold font-poppins text-gold-light mb-2 flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-base-white/80 text-sm sm:text-base pl-7">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
