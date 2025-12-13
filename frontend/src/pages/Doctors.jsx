import { Link } from "react-router-dom";

const Doctors = () => {
    const items = [
        { name: "Dr. Alfaz Ahmed", specialty: "Surgeon", experience: "15+ years", rating: 4.8 },
        { name: "Dr. Saleh Mahmud", specialty: "Neurologist", experience: "12+ years", rating: 4.9 },
        { name: "Dr. Farid Uddin", specialty: "Dermatologist", experience: "10+ years", rating: 4.7 },
        { name: "Dr. Sarah Johnson", specialty: "Pediatrician", experience: "8+ years", rating: 4.9 },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Find Doctors</h1>
                <p className="text-gray-600">Browse our specialists and book an appointment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((doctor, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-teal-500">
                        <div className="text-center mb-4">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-20 h-20 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="inline-block px-3 py-1 bg-lime-200 rounded-full text-xs font-semibold mb-2">
                                {doctor.specialty}
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 text-center">{doctor.name}</h3>
                        <p className="text-sm text-gray-600 text-center mb-3">{doctor.experience} experience</p>
                        <div className="flex items-center justify-center space-x-1 mb-4">
                            <span className="text-yellow-400">⭐</span>
                            <span className="font-semibold text-gray-900">{doctor.rating}</span>
                        </div>
                        <Link to={`/doctors/${index + 1}`} className="block w-full py-2.5 bg-teal-600 text-white text-center rounded-full font-medium hover:bg-teal-700 transition">
                            Book Appointment
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Doctors;
