import React from 'react';
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="relative z-10 bg-gradient-to-b from-[#8B1A1A] to-[#C84037] text-white py-10">
            <div className="container mx-auto px-16 max-md:px-6">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* About Section */}
                    <div>
                        <h4 className="text-xl font-bold mb-4 text-[#FFD700]">About Youth Camp 2026</h4>
                        <p className="text-xl leading-relaxed">
                            Join us for <span className="font-semibold text-[#FFD700]">Youth Camp 2026</span>, a camp filled with worship, activities, and unforgettable memories.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="text-lg">
                        <h4 className="text-xl font-bold mb-4 text-[#FFD700]">Contact Information</h4>
                        <ul className="space-y-3">
                            <li>YOUTH EVANGELICAL SOLDIERS OF CHRISTIAN ASSEMBLIES</li>
                            <li className="text-lg">
                                <strong>Address:</strong> Nandikotkur, Kurnool District, <br/>Andhra Pradesh - 518401
                            </li>
                            <li className="text-lg">
                                <strong>Phone:</strong> <a href="tel:+919177898146" className="text-[#FFD700] hover:underline">+91 91778 98146, 89850 32133</a>
                            </li>
                            <li className="text-lg">
                                <strong>Email:</strong>{" "}
                                <Link href="mailto:info@yescateam.com" className="text-[#FFD700] hover:underline">
                                    info@yescateam.com
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:pl-24">
                        <h4 className="text-xl font-bold mb-4 text-[#FFD700]">Quick Links</h4>
                        <ul className="space-y-3 text-lg">
                            <li>
                                <Link href="/about" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                    Registration Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-and-conditions" className="text-[#FFD700] hover:text-[#FFA500] transition-colors duration-200">
                                    Terms and Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider and Bottom Section */}
                <div className="mt-10 border-t border-[#E67E3A] pt-6 text-center">
                    <p className="text-sm">
                        &copy; 2025 Yesca Team. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
