'use client';

interface GameModeCardProps {
    title: string;
    titleColor: string;
    bgColor: string;
    children: React.ReactNode;
    onClick: () => void;
}

export default function GameModeCard({ title, titleColor, bgColor, children, onClick }: GameModeCardProps) {
    return (
        <div className="cursor-pointer" onClick={onClick}>
            <div className={`text-4xl font-extrabold text-shadow-custom ${titleColor} -mb-4 ml-4 relative z-10`}>
                {title}
            </div>
            <div className={`relative ${bgColor} rounded-xl p-4 border-4 border-white/80 shadow-lg`}>
                {children}
            </div>
        </div>
    )
}
