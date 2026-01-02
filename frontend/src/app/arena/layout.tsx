import Navbar from '@/components/Navbar';

export default function ArenaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Arena has its own fullscreen layout without navbar
    return <>{children}</>;
}
