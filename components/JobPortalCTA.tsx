import React from 'react';

const JobPortalCTA = () => {
    return (
        <div className='bg-white py-16 md:py-24 px-8 md:px-32 text-center'>
            <div className="w-full rounded-[2rem] px-6 py-20 text-center text-white bg-gradient-to-br from-[#0f2d1e] via-[#143d2b] to-[#1f4733]">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Find Jobs That Work For You – Anytime, Anywhere
                </h2>
                <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
                    Whether you're an international student or just looking for flexible work,
                    our platform connects you to jobs tailored to your visa, skills, and schedule.
                    Get hired faster and smarter with our streamlined process.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button className="bg-[#b6f758] hover:bg-[#a4e74f] text-black px-8 py-3 rounded-full text-lg font-semibold transition">
                        Explore Jobs
                    </button>
                    <button className="border border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-[#143d2b] transition">
                        Talk to Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobPortalCTA;
