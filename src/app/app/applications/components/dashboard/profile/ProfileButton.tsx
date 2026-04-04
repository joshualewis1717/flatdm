import Avatar from "./Avatar";
// small button that displays a users pfp + name as well as their role e.g. landlord or applicant
type props={
    role: 'Applicant' | 'Landlord';// i.e landlord or consultant
    username: string;
    profileUrl?: string;
    onClick?: ()=>void;
}

export default function ProfileButton({ role, username, profileUrl, onClick }: props) {
    return (
      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border 
      border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all group/prof text-left"
      onClick={onClick}>
        <Avatar username={username} imageSrc={profileUrl} size="md"/>
        <div className="flex-1 flex flex-col items-end gap-1.5 min-w-0">
          <span className="text-[11px] text-white/30 shrink-0 text-left">{role} ·</span>
          <span className="text-white/80 text-xs font-medium truncate text-left">{username}</span>
        </div>
      </button>
    );
  }
  