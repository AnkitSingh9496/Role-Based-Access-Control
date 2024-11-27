export const Layout = ({ children }) => {
    return (
      <main className="relative max-w-7xl mx-auto py-10 px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-200 to-pink-100" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse" />
        </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8">
          {children}
        </div>
      </main>
    );
  };
export default Layout;
  