import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkillTag } from "@/components/job-tracker/SkillTag";
import {
  ArrowRight,
  Code,
  Users,
  GraduationCap,
  Clock,
  MapPin,
  Briefcase,
  CheckCircle,
  Laptop,
  Zap,
} from "lucide-react";

const requiredSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "Git",
  "REST APIs",
  "Problem Solving",
  "Teamwork",
];

const benefits = [
  { icon: Laptop, title: "Remote Friendly", desc: "Work from anywhere with flexible hours" },
  { icon: GraduationCap, title: "Learning Budget", desc: "Annual allowance for courses and books" },
  { icon: Users, title: "Mentorship", desc: "One-on-one guidance from senior engineers" },
  { icon: Zap, title: "Real Projects", desc: "Work on production code from day one" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                Open Position
              </span>
              <span className="text-indigo-200 text-sm">Posted on June 15, 2025</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Software Engineering Intern
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Join our team and kickstart your career in software development. Work on real
              projects, learn from experienced mentors, and grow your skills.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-indigo-200 mb-10">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Internship
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Cairo, Egypt (Hybrid)
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                3 Months
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Engineering Team
              </div>
            </div>
            <Link to="/apply">
              <Button
                size="lg"
                className="bg-white text-indigo-700 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Job Description */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* About the Role */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Role</h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                <p>
                  We are looking for passionate Software Engineering Interns to join our growing
                  team. This is a unique opportunity to gain hands-on experience in a fast-paced
                  tech environment while working on products that impact thousands of users.
                </p>
                <p className="mt-4">
                  As an intern, you will be paired with experienced mentors who will guide you
                  through real-world projects. You will participate in code reviews, daily standups,
                  and team planning sessions — giving you a complete picture of what it is like
                  to work as a professional software engineer.
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Responsibilities</h2>
              <ul className="space-y-3">
                {[
                  "Develop and maintain web applications using React and Node.js",
                  "Collaborate with designers to implement responsive UI components",
                  "Write clean, well-documented, and testable code",
                  "Participate in code reviews and provide constructive feedback",
                  "Debug and fix issues reported by QA or users",
                  "Contribute to technical discussions and architecture decisions",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-3">
                {[
                  "Currently enrolled in a Computer Science or related degree program",
                  "Strong understanding of JavaScript fundamentals",
                  "Familiarity with HTML, CSS, and modern web development",
                  "Basic knowledge of Git version control",
                  "Excellent problem-solving and analytical skills",
                  "Good communication skills in English",
                  "Available for at least 3 months",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Skills */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Benefits</h3>
                <div className="space-y-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <benefit.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{benefit.title}</p>
                        <p className="text-sm text-gray-500">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Now</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ready to take the next step in your career? Submit your application today!
                </p>
                <Link to="/apply" className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Start Application
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
