import { Car } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1 rounded-md">
                            <Car size={18} />
                        </div>
                        <span className="font-bold text-lg">سيارتك</span>
                    </div>

                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                        © {new Date().getFullYear()} سيارتك. تم البرمجة بواسطة
                        <a
                            href="https://wa.me/9647829251200"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold hover:underline"
                        >
                            Muhanad AlQaissy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
