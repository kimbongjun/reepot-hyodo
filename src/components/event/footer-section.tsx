type Props = {
  title: string;
};

export function FooterSection({ title }: Props) {
  return (
    <footer id="footer" className="bg-gray-300">
      <div className="flex flex-col items-center gap-1.5 py-4">
        <div className="text-center text-gray-700 font-light text-xs">
          {title}
        </div>
        <a
          href="/privacy"
          className="text-xs text-gray-500 underline transition-colors hover:text-gray-700"
        >
          개인정보처리방침
        </a>
      </div>
    </footer>
  );
}
