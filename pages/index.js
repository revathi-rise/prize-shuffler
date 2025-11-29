import Head from "next/head";
import ShuffleBox from "../components/ShuffleBox";

export default function Home() {

  return (
    <>
      <Head>
        <title>Prize Shuffler</title>
        <meta name="description" content="Simple prize shuffler demo" />
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-semibold text-center mb-6">Prize Shuffler</h1>
          <ShuffleBox />
        </div>
      </main>
    </>
  );
}
