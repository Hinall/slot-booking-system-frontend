import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-purple-200">
      
      <div className="w-full h-full bg-white rounded-2xl shadow-xl flex overflow-hidden">
        
        {/* LEFT - FORM */}
        <div className="w-2/5 p-12 flex flex-col justify-center">
          {children}

        </div>

        {/* RIGHT - DESIGN */}
        <div
          className="w-3/5 text-white flex flex-col justify-end p-12 relative bg-contain bg-center overflow-hidden"
          style={{
            backgroundImage: "url('/9200459.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark blue transparent overlay for better text contrast */}
          <div className="absolute inset-0 bg-blue-900/50 z-0"></div>

          <div className="relative z-10 text-right">
            <h3 className="text-[20px] font-semibold leading-snug max-w-[320px] ml-auto mr-0">
              Schedule your appointments with ease
            </h3>
            <p className="text-[11px] text-white/80 leading-relaxed mt-4 max-w-[320px] ml-auto mr-0">
              Schedule your appointments with ease and manage your bookings in one platform.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;