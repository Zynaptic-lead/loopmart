import React from "react";
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logo} 
                alt="Loopmart" 
                className="h-12 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-white text-sm max-w-md mb-6">
              Your trusted marketplace for buying and selling quality products. 
              Connect with verified sellers and discover amazing deals across Nigeria.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-white" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} className="text-white" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} className="text-white" />
              </a>
              <a 
                href="mailto:info@loopmart.ng" 
                className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                aria-label="Email"
              >
                <Mail size={20} className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/about" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="/categories" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  Browse Categories
                </a>
              </li>
              <li>
                <a 
                  href="/sell" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  Sell on Loopmart
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/terms" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/help" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  Help Desk
                </a>
              </li>
              <li>
                <a 
                  href="/faq" 
                  className="text-white hover:text-white transition-colors duration-200 text-sm"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white text-sm text-center md:text-left">
              © {new Date().getFullYear()} Loopmart. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white">
              <span>Secure Payments</span>
              <span>•</span>
              <span>Verified Sellers</span>
              <span>•</span>
              <span>Customer Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;