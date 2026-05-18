interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
};

export default function UserAvatar({ name, avatarUrl, size = 'md' }: UserAvatarProps) {
  const initials = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const cls = sizeClasses[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${cls} rounded-full object-cover border-2 border-gray-200 flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${cls} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 border-2 border-indigo-100`}
    >
      <span className="font-bold text-white">{initials}</span>
    </div>
  );
}
