import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SEO } from '../components/SEO';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Contact form submission will be integrated with backend');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container-custom py-12">
      <SEO
        title="Contact"
        description="Get in touch with us. We're here to help!"
        keywords="contact, support, help, customer service"
      />
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        Contact Us
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Contact Information */}
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Get in Touch
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    Email
                  </h3>
                  <p className="text-text-secondary">support@store.com</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    Phone
                  </h3>
                  <p className="text-text-secondary">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    Address
                  </h3>
                  <p className="text-text-secondary">
                    123 Store St<br />
                    City, State 12345
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    Business Hours
                  </h3>
                  <p className="text-text-secondary">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                />
                <Button type="submit" variant="primary" fullWidth size="lg">
                  Send Message
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

