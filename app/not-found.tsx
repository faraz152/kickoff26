import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="hero">
      <h1>Off target 🥅</h1>
      <p className="lede">That page isn’t here. Maybe the schedule is what you’re after?</p>
      <div className="hero-cta">
        <Link href="/schedule/" className="btn btn-primary">
          Go to schedule
        </Link>
        <Link href="/" className="btn">
          Home
        </Link>
      </div>
    </div>
  );
}
