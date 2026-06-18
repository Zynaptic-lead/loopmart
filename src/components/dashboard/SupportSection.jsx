// src/components/dashboard/SupportSection.jsx
import React, { useState } from 'react';
import { MdSupportAgent, MdEmail, MdMessage, MdCheckCircle, MdHelp, MdPhone, MdAccessTime, MdError } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export default function SupportSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        // Auto-hide success message after 8 seconds
        setTimeout(() => setIsSubmitted(false), 8000);
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Support form error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
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
        
        {/* Success Message */}
        {isSubmitted && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-3">
            <MdCheckCircle className="text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Message sent successfully! 🎉</p>
              <p className="text-sm mt-1">
                We'll get back to you via <strong>{formData.email || 'your email'}</strong> within 24 hours. 
                Please check your inbox (and spam folder) for our response.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <MdError className="text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Oops! Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-sm mt-1">
                You can also reach us directly via <a href="mailto:support@loopmart.ng" className="text-red-600 underline">support@loopmart.ng</a> or WhatsApp.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <textarea
            name="message"
            placeholder="How can we help you?"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          ></textarea>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>

        {/* Additional note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p>💡 We'll respond to your email within 24 hours. Please check your spam folder if you don't see our reply.</p>
        </div>
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