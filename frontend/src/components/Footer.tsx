import cputIcon from '../assets/cput-icon.jpg';

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-ui-border py-4 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between z-10 text-sm">
            <div className="font-bold text-brand-primary mb-4 sm:mb-0">
                Campus Connect
            </div>
            <div className="flex space-x-6 text-muted mb-4 sm:mb-0">
                <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Campus Directory</a>
            </div>

            <div className="flex items-center gap-3">
                <img
                    src={cputIcon}
                    alt="CPUT Logo"
                    className="h-6 w-auto object-contain opacity-60"
                />
                <span className="text-muted text-xs">
                    © 2026 Campus Connect. All rights reserved.
                </span>
            </div>
        </footer>
    );
}