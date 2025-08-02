// export const formStyles = {
//     container: "h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200",
//     card: "bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100",
//     title: "text-3xl font-bold text-center text-gray-800 mb-6",

//     errorText: "text-red-500 text-center text-sm mb-3",

//     form: "space-y-5",

//     label: "block text-sm font-medium text-gray-700 mb-1",
//     required: "text-red-500",

//     inputBase: "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition",
//     inputError: "border-red-500 focus:ring-red-500 focus:border-red-500",
//     inputIconPadding: "pr-10",

//     icon: {
//         valid: "absolute right-2 top-9 h-5 w-5 text-green-500",
//         invalid: "absolute right-2 top-9 h-5 w-5 text-red-500",
//         eye: "absolute right-3 top-9 h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition",
//     },

//     button: {
//         primary: "w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold",
//         link: "text-green-600 hover:text-green-700 underline transition",
//     },

//     helperText: "text-red-500 text-xs mt-1",
//     footerText: "mt-4 text-center text-sm text-gray-600",

//     googleWrapper: "flex flex-col items-center space-y-2 mt-4",
//     googleTitle: "text-gray-500 text-sm",
// };


export const formStyles = {
    container: "min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8",

    // ⬇️ Added `max-h-screen` & `overflow-y-auto` for scroll
    card: "bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg border border-gray-100 transition-all duration-300 max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ",

    title: "text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 text-gray-800",

    errorGeneral: "text-red-500 text-center mb-4 font-bold",
    errorBold: "text-red-500 text-center mb-4 font-bold",
    form: "space-y-5",

    center: "flex flex-col items-center",
    centerWithGap: "flex items-center gap-2",
    
    profile: {
        wrapper: "flex flex-col items-center space-y-2 ",
        uploadButton: "flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 transition cursor-pointer shadow",
        icon: "text-gray-400 ",
        previewWrapper: "relative",
        previewImage: "w-20 h-20 sm:w-24 sm:h-24  rounded-full object-cover border border-gray-300 shadow-md",
        removeButton: "absolute -top-2 -right-2 bg-red-500 text-white  cursor-pointer rounded-full p-1 shadow hover:bg-red-600",
        uploadText: "text-xs text-gray-500 mt-1 "
    },

    label: "block text-xs sm:text-sm font-medium text-gray-700 mb-1",
    required: "text-red-500",

    inputWrapper: "relative",
    inputBase: "w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition",
    inputError: "border-red-500 focus:ring-red-500 focus:border-red-500",
    inputIconRight: "absolute right-2 top-8 sm:top-9",

    icon: {
        valid: "w-4 h-4 sm:w-5 sm:h-5 text-green-500",
        invalid: "w-4 h-4 sm:w-5 sm:h-5 text-red-500",
        eye: "w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-gray-600 cursor-pointer transition"
    },

    passwordStrengthBar: "h-2 w-full bg-gray-200 rounded overflow-hidden mt-2",
    passwordStrengthInner: {
        weak: "h-2 bg-red-500 w-1/3",
        medium: "h-2 bg-yellow-500 w-2/3",
        strong: "h-2 bg-green-500 w-full"
    },
    passwordStrengthLabel: {
        weak: "text-xs mt-1 font-semibold text-red-500",
        medium: "text-xs mt-1 font-semibold text-yellow-500",
        strong: "text-xs mt-1 font-semibold text-green-500"
    },

    buttonPrimary: "w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 sm:py-2.5 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold text-sm sm:text-base  cursor-pointer",

    footer: "text-center text-xs sm:text-sm mt-4 text-gray-600",
    link: "text-blue-600 hover:underline  cursor-pointer",




    googleWrapper: "flex flex-col items-center space-y-3 mt-5",
    googleText: "text-gray-500 text-sm",

    googleButton: "flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition gap-2 cursor-pointer",
    googleIcon: "w-5 h-5",
    googleLabel: "text-gray-700 text-sm font-medium",
};
