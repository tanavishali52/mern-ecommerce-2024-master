import { useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon, GithubIcon, LinkedinIcon, MailIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Import images
import aftab1 from '@/assets/aftab-3 (2).jpg';
import aftab2 from '@/assets/aftab-3 (3).jpg';
import aftab3 from '@/assets/aftab-3 (4).JPG?url';

const BlogPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  const skills = {
    frontend: ['HTML', 'CSS', 'JavaScript', 'React.js', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
    backend: ['Node.js', 'Express.js', 'REST APIs', 'Authentication Systems'],
    database: ['MongoDB', 'Firebase (basic knowledge)'],
    other: ['Git & GitHub', 'API Integration', 'Responsive Design', 'UI/UX basics']
  };

  const projects = [
    'Full Stack Web Applications',
    'Admin Dashboards',
    'Portfolio Websites',
    'AI-powered web platforms',
    'Modern UI interfaces'
  ];

  const education = [
    'Web Development Fundamentals',
    'Software Engineering Concepts',
    'Database Management',
    'Problem Solving & Algorithms'
  ];

  const images = [
    { src: aftab1, alt: 'Muhammad Aftab Akram - Profile 1' },
    { src: aftab2, alt: 'Muhammad Aftab Akram - Profile 2' },
    { src: aftab3, alt: 'Muhammad Aftab Akram - Profile 3' }
  ];

  return (
    <div className="min-h-screen bg-white relative z-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/shop/home')}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Shop
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Updated December 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl bg-white relative z-20">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <img
              src={aftab1}
              alt="Muhammad Aftab Akram"
              className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 shadow-lg mx-auto"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Me – Muhammad Aftab Akram
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hello! My name is Muhammad Aftab Akram, and I am a passionate Full Stack Developer
            who loves building modern, responsive, and user-friendly web applications.
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserIcon className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              I specialize in both frontend and backend development, turning ideas into fully functional
              digital products. My goal is to create clean, fast, and scalable web solutions that solve
              real-world problems.
            </p>
          </CardContent>
        </Card>

        {/* Images Gallery */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <ExternalLinkIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              I have a strong educational background that supports my journey in software development.
              Along with formal studies, I continuously learn new technologies to stay updated in the
              fast-changing world of web development.
            </p>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">I focus on:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {education.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              As a Full Stack Developer, I work with a wide range of technologies:
            </p>

            <div className="space-y-6">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                    {category === 'other' ? 'Other Skills' : category}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillList.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What I Do */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What I Do</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              I enjoy building:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{project}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mt-6">
              I always focus on writing clean code and building projects that are scalable and production-ready.
            </p>
          </CardContent>
        </Card>

        {/* My Vision */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              My goal is to become a highly skilled MERN Stack Developer and work on impactful real-world projects.
              I also aim to grow in AI-integrated web development and build smart applications that improve user experience.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">Contact Me</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:aftabakramjutt2000@gmail.com"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <MailIcon className="w-5 h-5" />
                <span className="font-medium">aftabakramjutt2000@gmail.com</span>
              </a>
              <a
                href="https://aftab-webdeveloper.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <ExternalLinkIcon className="w-5 h-5" />
                <span className="font-medium">Portfolio</span>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <a
                href="https://github.com/aftab-01"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <GithubIcon className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/aftab-akram-562aab356"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <LinkedinIcon className="w-6 h-6" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <ClockIcon className="w-4 h-4" />
            <span className="text-sm">Last updated: December 2024</span>
          </div>
          <p className="text-gray-600">
            Thank you for visiting my blog! Feel free to reach out if you'd like to collaborate or just say hello.
          </p>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage; 