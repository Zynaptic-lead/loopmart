// src/components/dashboard/SupportSection.jsx
import React, { useState } from 'react';
import { MdSupportAgent, MdEmail, MdMessage, MdCheckCircle, MdHelp, MdPhone, MdAccessTime } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export default function SupportSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send to your backend
    console.log('Support request:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    { q: "How do I get started with LoopMart?", a: "Simply navigate to the Shop section to browse products or the Learn section for tutorials." },
    { q: "How can I earn rewards?", a: "Complete product reviews and refer friends to earn points and discounts." },
    { q: "Is my payment information secure?", a: "Yes, we use industry-standard encryption to protect all your payment data." },
    { q: "How long does shipping take?", a: "Shipping times vary by seller, typically 3-7 business days within Nigeria." },
    { q: "Can I return a product?", a: "Returns are handled on a case-by-case basis. Contact support within 7 days of delivery." }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <MdSupportAgent className="text-4xl" />
          <h1 className="text-3xl font-bold">Support Center</h1>
        </div>
        <p className="text-lg opacity-90">
          We're here to help 24/7. Choose how you'd like to get in touch.
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <MdEmail className="text-3xl text-yellow-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 mb-3">Response within 24 hours</p>
          <a href="mailto:support@loopmart.ng" className="text-yellow-600 text-sm hover:underline">
            support@loopmart.ng
          </a>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <FaWhatsapp className="text-3xl text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">WhatsApp</h3>
          <p className="text-sm text-gray-600 mb-3">Fastest response</p>
          <a href="https://wa.me/2341234567890" className="text-green-600 text-sm hover:underline">
            +234 123 456 7890
          </a>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <MdPhone className="text-3xl text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Phone Support</h3>
          <p className="text-sm text-gray-600 mb-3">Mon-Fri, 9AM-6PM</p>
          <a href="tel:+2341234567890" className="text-blue-600 text-sm hover:underline">
            +234 123 456 7890
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MdMessage className="text-yellow-500" />
          Send us a message
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <textarea
            name="message"
            placeholder="How can we help you?"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          ></textarea>
          <button
            type="submit"
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Send Message
          </button>
        </form>
        {isSubmitted && (
          <div className="mt-4 bg-green-50 text-green-600 p-3 rounded-lg flex items-center gap-2">
            <MdCheckCircle /> Message sent successfully! We'll respond within 24 hours.
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <MdHelp className="text-yellow-500 text-xl" />
          <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details key={idx} className="border-b pb-3 group">
              <summary className="font-semibold cursor-pointer hover:text-yellow-600 transition-colors">
                {faq.q}
              </summary>
              <p className="mt-2 text-gray-600 pl-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Response Time Info */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MdAccessTime className="text-yellow-500" />
          <span className="text-sm text-gray-600">Average response time: <strong>Under 2 hours</strong></span>
        </div>
        <div className="text-sm text-gray-500">
          Operating Hours: 24/7 Support
        </div>
      </div>
    </div>
  );
}