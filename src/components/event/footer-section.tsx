type Props = {
  title: string;
};

export function FooterSection({ title }: Props) {
  return (
    <footer id="footer" className="space-y-6 bg-gray-300">
      <div>
        <div className="copyright text-center text-gray-700 font-light text-xs py-3">
          {title}
        </div>
      </div>
    </footer>
  );
}
