import Link from "next/link";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed top-16 bottom-16 w-64 bg-gray-100 p-4 overflow-y-auto transition-transform duration-300 z-30 lg:z-0 lg:block`}
      >
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <nav className="space-y-2">
          <Link href="/dashboard">
            <div className="p-2 hover:bg-gray-200 rounded">Dashboard</div>
          </Link>
          <Link href="/cart">
            <div className="p-2 hover:bg-gray-200 rounded">Cart</div>
          </Link>
          <Link href="/account">
            <div className="p-2 hover:bg-gray-200 rounded">Account</div>
          </Link>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
