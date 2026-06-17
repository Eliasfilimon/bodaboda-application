import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMotorcycle, FaArrowRight, FaStar, FaShieldAlt } from 'react-icons/fa';
import { HiOutlineMapPin, HiOutlineClock, HiOutlineCreditCard, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';

export const HomePage = () => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <div className="min-h-screen bg-twende-background font-poppins flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-lg border-b border-twende-border sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-twende-primary rounded-xl flex items-center justify-center text-white shadow-sm">
            <FaMotorcycle className="text-xl" />
          </div>
          <span className="text-2xl font-black tracking-tight text-twende-text">BodaGo</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-semibold text-twende-text-secondary text-sm">
          <a href="#features" className="hover:text-twende-primary transition-colors">Features</a>
          <a href="#safety" className="hover:text-twende-primary transition-colors">Safety</a>
          <a href="#drive" className="hover:text-twende-primary transition-colors">Drive with Us</a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              to={userType === 'rider' ? '/dashboard' : '/request'} 
              className="px-5 py-2.5 bg-twende-primary text-white text-sm font-bold rounded-xl hover:bg-twende-primary-hover shadow-sm transition-all active:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden md:block text-sm font-bold text-twende-text hover:text-twende-primary transition-colors">
                Log in
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 bg-twende-text text-white text-sm font-bold rounded-xl hover:bg-gray-800 shadow-sm transition-all active:scale-95"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40 border-b border-twende-border">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-twende-brand-light rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-twende-primary-light rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-twende-success/10 text-twende-success font-bold text-xs uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-twende-success animate-pulse"></span>
                Now Live in Dodoma
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-twende-text leading-[1.1] tracking-tight mb-6">
                Your ride. <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-twende-primary to-twende-brand">Your way.</span> <br />
                Instantly.
              </h1>
              <p className="text-lg text-twende-text-secondary font-medium mb-10 max-w-xl mx-auto lg:mx-0">
                Request a safe, fast bodaboda ride or delivery with just one tap. Professional drivers, transparent pricing, and 24/7 support.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  to={isAuthenticated ? "/request" : "/login"} 
                  className="w-full sm:w-auto px-8 py-4 bg-twende-primary text-white text-lg font-bold rounded-xl hover:bg-twende-primary-hover shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Request a Ride <FaArrowRight className="text-sm" />
                </Link>
                <Link 
                  to="/rider-register" 
                  className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-twende-border text-twende-text text-lg font-bold rounded-xl hover:border-twende-primary hover:text-twende-primary hover:bg-twende-primary/5 shadow-sm transition-all"
                >
                  Drive & Earn
                </Link>
              </div>
            </div>

            {/* Hero Graphic / App Mockup Placeholder */}
            <div className="flex-1 w-full max-w-md lg:max-w-full">
              <div className="relative aspect-[4/5] lg:aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-[3rem] border border-twende-border shadow-2xl overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                
                {/* Mockup UI Elements */}
                <div className="relative z-10 w-64 bg-white rounded-[2rem] shadow-xl border border-twende-border p-4">
                  <div className="w-full h-32 bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HiOutlineMapPin className="text-4xl text-twende-primary opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-twende-success/20 flex items-center justify-center">
                          <FaMotorcycle className="text-twende-success text-xs" />
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-twende-primary rounded w-12"></div>
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-1/4 -right-6 lg:-right-10 bg-white px-4 py-3 rounded-2xl shadow-lg border border-twende-border flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="w-10 h-10 rounded-full bg-twende-brand/10 flex items-center justify-center text-twende-brand">
                    <FaStar />
                  </div>
                  <div>
                    <p className="text-xs text-twende-text-secondary font-bold uppercase">Average Rating</p>
                    <p className="font-black text-twende-text">4.9 / 5.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-twende-border bg-white">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-twende-border">
              {[
                { label: 'Active Riders', value: '10k+' },
                { label: 'Completed Trips', value: '1M+' },
                { label: 'Cities', value: 'Dodoma' },
                { label: 'Average ETA', value: '< 3 min' },
              ].map((stat, i) => (
                <div key={i} className="text-center px-4">
                  <p className="text-3xl md:text-4xl font-black text-twende-text mb-1">{stat.value}</p>
                  <p className="text-sm font-bold text-twende-text-secondary uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-twende-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-twende-text mb-4">Why choose BodaGo?</h2>
              <p className="text-twende-text-secondary font-medium">We built this platform to provide the safest, most reliable, and technologically advanced bodaboda experience in Tanzania.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <HiOutlineClock className="text-3xl" />, 
                  title: 'Lightning Fast', 
                  desc: 'Our advanced matching algorithm connects you with the nearest rider in seconds, reducing wait times to an absolute minimum.' 
                },
                { 
                  icon: <HiOutlineCreditCard className="text-3xl" />, 
                  title: 'Transparent Pricing', 
                  desc: 'Know exactly what you\'ll pay before you book. No hidden fees, no haggling. Just fair, upfront pricing.' 
                },
                { 
                  icon: <FaShieldAlt className="text-3xl" />, 
                  title: 'Verified Safety', 
                  desc: 'Every rider is thoroughly vetted, registered, and tracked in real-time. Share your trip status with loved ones instantly.' 
                },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] border border-twende-border shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-twende-primary/10 rounded-2xl flex items-center justify-center text-twende-primary mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-twende-text mb-3">{feature.title}</h3>
                  <p className="text-twende-text-secondary leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white border-y border-twende-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-3xl lg:text-4xl font-black text-twende-text mb-10">Get moving in 3 easy steps</h2>
                
                <div className="space-y-8">
                  {[
                    { step: '01', title: 'Open the app', desc: 'Set your destination and see fare estimates instantly.', icon: <HiOutlineDevicePhoneMobile /> },
                    { step: '02', title: 'Request a ride', desc: 'Get matched with a nearby verified rider and track their arrival.', icon: <FaMotorcycle /> },
                    { step: '03', title: 'Arrive safely', desc: 'Enjoy the ride, pay seamlessly, and rate your experience.', icon: <HiOutlineMapPin /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-twende-brand/10 rounded-2xl flex items-center justify-center text-twende-brand font-black text-xl flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-twende-text mb-2 flex items-center gap-2">
                          {item.title}
                        </h3>
                        <p className="text-twende-text-secondary font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-[4/3] bg-twende-background rounded-[2rem] border border-twende-border flex items-center justify-center overflow-hidden relative">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#2563EB 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                  <div className="w-48 h-48 bg-twende-primary rounded-full absolute mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                  <div className="w-48 h-48 bg-twende-brand rounded-full absolute top-10 right-10 mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                  
                  <div className="relative z-10 text-center">
                    <FaMotorcycle className="text-8xl text-twende-primary opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="drive" className="py-24 bg-twende-navy text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-twende-primary/20 to-twende-brand/20"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">Drive with BodaGo</h2>
            <p className="text-lg text-gray-300 font-medium mb-10 max-w-2xl mx-auto">
              Be your own boss. Enjoy flexible hours, competitive earnings, and a platform that respects your hustle. Join the best drivers in Dodoma.
            </p>
            <Link 
              to="/rider-register" 
              className="inline-flex px-8 py-4 bg-white text-twende-text text-lg font-bold rounded-xl hover:bg-gray-100 shadow-[0_8px_20px_rgba(255,255,255,0.15)] transition-all transform hover:-translate-y-1 items-center gap-2"
            >
              Sign up as a Rider <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-twende-border pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <FaMotorcycle className="text-twende-primary text-2xl" />
                <span className="text-xl font-black text-twende-text">BodaGo</span>
              </div>
              <p className="text-sm text-twende-text-secondary font-medium mb-6">
                Redefining urban mobility in Dodoma with safe, fast, and reliable transport.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-twende-text mb-4 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-twende-text-secondary">
                <li><a href="#" className="hover:text-twende-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-twende-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-twende-primary transition-colors">Newsroom</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-twende-text mb-4 uppercase tracking-wider text-sm">Products</h4>
              <ul className="space-y-3 text-sm font-medium text-twende-text-secondary">
                <li><a href="#" className="hover:text-twende-primary transition-colors">Ride</a></li>
                <li><a href="#" className="hover:text-twende-primary transition-colors">Drive</a></li>
                <li><a href="#" className="hover:text-twende-primary transition-colors">Deliveries</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-twende-text mb-4 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-twende-text-secondary">
                <li><a href="#" className="hover:text-twende-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-twende-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-twende-primary transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-twende-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-twende-text-secondary">
              &copy; {new Date().getFullYear()} BodaGo Technologies Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm font-bold text-twende-text-secondary">
              <a href="#" className="hover:text-twende-primary transition-colors">Dodoma, Tanzania</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
