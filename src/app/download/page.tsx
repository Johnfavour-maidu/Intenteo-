import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Download Intenteo | Android App",
  description: "Download the Intenteo Android app — live with intention.",
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F6FF] via-white to-[#FFF4EC] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <img
            src="/favicon-192.png"
            alt="Intenteo"
            width={80}
            height={80}
            className="mx-auto rounded-2xl shadow-lg mb-6"
          />
          <h1 className="text-4xl font-extrabold text-[#1E0E6B] mb-2">
            Intente<span className="text-[#E8873A]">o</span>
          </h1>
          <p className="text-gray-500 text-lg">Live with intention</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Android App</h2>
          <p className="text-sm text-gray-500 mb-6">
            Download the latest version of Intenteo for Android.
          </p>

          <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-6">
            <span>v1.0.0</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>~74 MB</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>Android 7.0+</span>
          </div>

          <a
            href="/Intenteo-v1.0.0.apk"
            download
            className="inline-flex items-center gap-2 bg-[#1E0E6B] hover:bg-[#2A1480] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg w-full justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download APK
          </a>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>You may need to enable "Install from unknown sources" on your device.</p>
          <p>Requires Android 7.0 (Nougat) or later.</p>
        </div>
      </div>
    </div>
  )
}
