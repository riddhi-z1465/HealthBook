import PropTypes from "prop-types";

const AuthPromptModal = ({ open, doctorName, onClose, onLogin, onRegister }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                    🔒
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-gray-900">Login required</h3>
                <p className="mt-2 text-sm text-gray-600">
                    You need to be logged in as a patient to book {doctorName ? `with ${doctorName}` : "this doctor"}.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={onLogin}
                        className="w-full rounded-full bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700"
                        type="button"
                    >
                        Login
                    </button>
                    <button
                        onClick={onRegister}
                        className="w-full rounded-full border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        type="button"
                    >
                        Register
                    </button>
                    <button
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-400 hover:text-gray-500"
                        type="button"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

AuthPromptModal.propTypes = {
    open: PropTypes.bool.isRequired,
    doctorName: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onRegister: PropTypes.func.isRequired,
};

export default AuthPromptModal;
