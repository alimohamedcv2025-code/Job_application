import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span className="text-lg font-semibold text-white">JobTracker</span>
            </div>
            <p className="text-sm text-gray-400">
              Professional job application management system. Streamline your hiring process
              with our easy-to-use platform.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-indigo-400" />
                careers@jobtracker.com
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-indigo-400" />
                +20 123 456 7890
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-indigo-400" />
                Cairo, Egypt
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm hover:text-indigo-400 transition-colors">
                  Job Description
                </a>
              </li>
              <li>
                <a href="/apply" className="text-sm hover:text-indigo-400 transition-colors">
                  Apply Now
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          JobTracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
