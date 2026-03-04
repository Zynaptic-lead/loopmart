import React from 'react';
import { FaShieldAlt, FaUser, FaList, FaMapMarkerAlt, FaChartBar, FaMobileAlt, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

export default function PrivacyPolicySection() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">Privacy Policy</h1>
        <p className="text-gray-600">How we protect and handle your information</p>
      </div>

      {/* Privacy Policy Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-yellow-500 px-6 py-4 border-b border-yellow-600">
          <div className="flex items-center space-x-3">
            <FaShieldAlt className="text-black text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-black">LoopMart Privacy Policy</h2>
              <p className="text-black/80 text-sm">Effective Date: 11/11/2024</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Welcome to LoopMart! Your privacy is important to us, and we are committed to protecting your personal information. This Privacy Policy outlines how LoopMart collects, uses, stores, and protects your information. By using our platform, you agree to the terms of this Privacy Policy.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center space-x-2 mb-4">
              <FaUser className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">1. Information We Collect</h3>
            </div>
            <p className="text-gray-700 mb-4">
              To provide and improve our services, we collect various types of information, which may include:
            </p>
            <div className="space-y-4 ml-4">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full mt-1">
                  <FaUser className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Personal Information</h4>
                  <p className="text-gray-700 text-sm">
                    When you create an account, subscribe as a vetted seller, or contact us for support, we may collect information such as your name, email address, phone number, and other necessary contact information.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full mt-1">
                  <FaList className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Listing and Transaction Information</h4>
                  <p className="text-gray-700 text-sm">
                    To support listing and browsing services, we collect information on products or services you list, including descriptions, photos, prices, and other listing details.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full mt-1">
                  <FaMapMarkerAlt className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Location Information</h4>
                  <p className="text-gray-700 text-sm">
                    We may collect location data from your device to enhance search results, optimize listings by proximity, and improve the user experience.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full mt-1">
                  <FaChartBar className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Usage Information</h4>
                  <p className="text-gray-700 text-sm">
                    We collect information about your interactions with LoopMart, including the pages you visit, features you use, and time spent on our site to understand how users interact with our platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full mt-1">
                  <FaMobileAlt className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Device and Technical Information</h4>
                  <p className="text-gray-700 text-sm">
                    We may collect technical details like IP address, browser type, operating system, and device type to maintain the security and functionality of our services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: How We Use Your Information */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center space-x-2 mb-4">
              <FaChartBar className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h3>
            </div>
            <p className="text-gray-700 mb-4">
              LoopMart uses the information we collect for purposes including:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Providing Services:</strong> We use your information to create and manage your account, connect you with buyers or sellers, and facilitate interactions on LoopMart.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Improving Our Platform:</strong> Information about user behavior helps us improve our features, enhance usability, and optimize content to better serve our users.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Security and Fraud Prevention:</strong> To keep LoopMart safe, we monitor for any unauthorized access, activity that violates our terms, and potential security risks.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Customer Support:</strong> We use your contact information to respond to your inquiries, resolve issues, and improve customer support.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Communication:</strong> With your permission, we may send you updates, notifications, and promotional offers. You can opt out of marketing communications at any time.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: How We Share Your Information */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center space-x-2 mb-4">
              <FaShieldAlt className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">3. How We Share Your Information</h3>
            </div>
            <p className="text-gray-700 mb-4">
              LoopMart is committed to your privacy and will not sell, trade, or share your personal information with third parties except in the following situations:
            </p>
            <ul className="space-y-3 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>With Buyers and Sellers:</strong> To enable transactions, certain information (such as your contact details, location, and listing details) may be visible to other users. For vetted sellers, badges and enhanced profile visibility may be displayed.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>With Service Providers:</strong> We may share your information with third-party service providers to assist with site maintenance, analytics, and customer support. These providers are bound by confidentiality agreements and are only permitted to use your information as necessary to perform their functions.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>For Legal Compliance:</strong> We may disclose information when required by law, such as to comply with legal processes, respond to government requests, or protect the rights and safety of LoopMart and our users.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, user information may be transferred to a third party. We will notify you if your information is subject to a different privacy policy as a result of such a transfer.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Data Security */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center space-x-2 mb-4">
              <FaExclamationTriangle className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">4. Data Security</h3>
            </div>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your information from unauthorized access, disclosure, alteration, or destruction. While we strive to protect your data, no internet-based service is completely secure. We recommend using strong passwords and keeping your login credentials confidential.
            </p>
          </div>

          {/* Section 5: User Rights */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center space-x-2 mb-4">
              <FaUser className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">5. User Rights</h3>
            </div>
            <p className="text-gray-700 mb-4">You have the following rights regarding your information:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Access:</strong> You can request access to the personal data we hold about you.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Correction:</strong> You may correct any inaccuracies in your information through your account settings.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Deletion:</strong> You have the right to request deletion of your account or specific information, subject to any legal requirements.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-700"><strong>Data Portability:</strong> Where applicable, you may request a copy of your data in a portable format.</span>
              </li>
            </ul>
          </div>

          {/* Section 6: Third-Party Links */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Third-Party Links</h3>
            <p className="text-gray-700">
              Our platform may contain links to third party websites. We are not responsible for the privacy practices of these external sites, so we encourage you to review their privacy policies.
            </p>
          </div>

          {/* Section 7: Changes to Our Privacy Policy */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Changes to Our Privacy Policy</h3>
            <p className="text-gray-700">
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When we make significant updates, we will notify you via email or an announcement on our website. Please review this page regularly for the latest information on our privacy practices.
            </p>
          </div>

          {/* Section 8: Contact Us */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center space-x-2 mb-4">
              <FaEnvelope className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">8. Contact Us</h3>
            </div>
            <p className="text-gray-700 mb-2">
              If you have any questions or concerns regarding this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-900 font-semibold">Email: info@loopmart.ng</p>
            </div>
          </div>

          {/* Final Acknowledgement */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-gray-700 text-center">
              By using LoopMart, you acknowledge that you have read and understood this Privacy Policy and agree to its terms. Thank you for trusting LoopMart as your marketplace for genuine connections!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}