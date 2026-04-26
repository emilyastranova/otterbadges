import styles from "./page.module.css";
import Link from "next/link";
import { FilledButton } from "@/components/MaterialUI";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to OtterBadges</h1>
        <p className={styles.description}>
          Create, distribute, and collect digital achievement badges across your organization.
        </p>
        <div className={styles.actions}>
          <Link href="/marketplace">
            <FilledButton>Explore Badges</FilledButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
