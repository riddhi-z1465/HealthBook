import { Link, useParams } from "react-router-dom";

const DoctorDetails = () => {
    const { id } = useParams();

    const items = [
        { name: "Dr. Alfaz Ahmed", specialty: "Surgeon", experience: "15+ years", rating: 4.8, bio: "Experienced surgeon specializing in minimally invasive procedures." },
        { name: "Dr. Saleh Mahmud", specialty: "Neurologist", experience: "12+ years", rating: 4.9, bio: "Neurologist focusing on neurodegenerative disorders and patient care." },
        { name: "Dr. Farid Uddin", specialty: "Dermatologist", experience: "10+ years", rating: 4.7, bio: "Dermatologist with expertise in cosmetic and medical dermatology." },
        { name: "Dr. Sarah Johnson", specialty: "Pediatrician", experience: "8+ years", rating: 4.9, bio: "Pediatrician dedicated to holistic child healthcare." },
    ];

    const doctor = items[(Number(id) - 1) % items.length] || items[0];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="w-40 h-40 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-24 h-24 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="inline-block px-3 py-1 bg-lime-200 rounded-full text-xs font-semibold mb-2">{doctor.specialty}</div>
                    <p className="text-sm text-gray-600">{doctor.experience} experience</p>
                    <div className="flex items-center space-x-1 mt-2">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-semibold text-gray-900">{doctor.rating}</span>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">{doctor.name}</h1>
                    <p className="text-xs text-gray-500 mb-2">Doctor ID: {id}</p>
                    <p className="text-gray-700 mb-6">{doctor.bio}</p>
                    <div className="space-x-3">
                        <Link to={`/doctors`} className="px-6 py-2.5 border-2 border-teal-600 text-teal-600 rounded-full font-medium hover:bg-teal-50 transition">Back to list</Link>
                        <button className="px-6 py-2.5 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition">Book Appointment</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetails;
