export default function Footer() {
    return (
      <footer className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Virtual Time Capsule. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }