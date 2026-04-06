// simplecomponent to display the pfp of a specific user
type props={
    username: string;
    imageSrc?: string;
    size?: 'sm' | 'md'
}
export default function Avatar({ username, imageSrc, size = 'sm' }: props) {
    const initials = username.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const dim = size === 'md' ? 'w-9 h-9 text-xs' : 'w-7 h-7 text-[10px]';
    return (
      <div className={`${dim} rounded-full shrink-0 overflow-hidden bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center font-semibold text-white/70`}>
        {imageSrc ? <img src={imageSrc} alt={username} className="w-full h-full object-cover" /> : <span>{initials}</span>}
      </div>
    );
  }