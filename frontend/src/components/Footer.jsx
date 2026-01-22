import { Link } from 'react-router-dom'
import { FaTwitter, FaDiscord, FaGithub, FaTelegram } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="font-bold text-xl">RaiseHive</span>
            </div>
            <p className="text-gray-400 text-sm">
              Decentralized crowdfunding platform powered by blockchain technology.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">
                <FaTwitter size={20} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">
                <FaDiscord size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">
                <FaGithub size={20} />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">
                <FaTelegram size={20} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/explore" className="hover:text-white transition">Explore Campaigns</Link></li>
              <li><Link to="/create" className="hover:text-white transition">Start a Campaign</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition">How it Works</Link></li>
              <li><Link to="/success-stories" className="hover:text-white transition">Success Stories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/trust-safety" className="hover:text-white transition">Trust & Safety</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link to="/guidelines" className="hover:text-white transition">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} RaiseHive. All rights reserved. Built with ❤️ on Ethereum.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer