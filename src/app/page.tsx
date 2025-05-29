import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-200 p-4 sm:p-8 flex flex-col items-center justify-center font-inter text-center">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-900 mb-6 leading-tight">
        Welcome to the Bingo Card Generator!
      </h1>
      <p className="text-xl sm:text-2xl text-gray-700 mb-10 max-w-3xl">
        Create custom bingo cards for school-age children with a variety of fun topics.
      </p>
      <Link href="/create">
        <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
          Start Creating Cards
        </div>
      </Link>
    </div>
  );
}
