import { GLYPH } from "@/lib/colors";

/** The header's decorative bird-of-cards mascot. Purely visual. */
export function HeaderMascot() {
  return (
    <div className="relative h-[104px] w-[116px] flex-none">
      <div className="absolute left-[6px] top-[10px] h-[18px] w-[18px] rounded-full bg-[#FFD23F]" />
      <div
        className="absolute bottom-1 left-0 h-[70px] w-[58px] rounded-[18px] bg-[#FFD23F] shadow-[0_6px_14px_rgba(110,80,200,0.18)]"
        style={{ transform: "rotate(-13deg)" }}
      />
      <div
        className="absolute bottom-[4px] left-4 h-[70px] w-[58px] rounded-[18px] bg-[#FF7EB6] shadow-[0_6px_14px_rgba(200,60,130,0.16)]"
        style={{ transform: "rotate(-5deg)" }}
      />
      <div
        className="absolute bottom-0 left-[34px] h-[72px] w-[60px] rounded-[18px] bg-white shadow-[0_8px_18px_rgba(90,80,160,0.16)]"
        style={{ transform: "rotate(7deg)" }}
      >
        <div className="flex justify-center gap-3.5 pt-6">
          <div className="h-[10px] w-[7px] rounded bg-ink" />
          <div className="h-[10px] w-[7px] rounded bg-ink" />
        </div>
        <div className="mx-auto mt-[5px] h-[10px] w-5 rounded-b-[20px] border-b-[2.5px] border-ink" />
        <div className="mt-[3px] flex justify-center gap-[21px]">
          <div className="h-1.5 w-[11px] rounded-full bg-[#FFC2DA]" />
          <div className="h-1.5 w-[11px] rounded-full bg-[#FFC2DA]" />
        </div>
      </div>
      <div
        className="absolute right-[2px] top-0 h-[14px] w-[14px] bg-[#2FA9F5]"
        style={{ clipPath: GLYPH.star }}
      />
    </div>
  );
}

/** The small bird peeking out of the "waiting on others" panel. Purely visual. */
export function PanelMascot() {
  return (
    <div className="absolute right-[22px] top-[-18px] h-[46px] w-[54px]">
      <div className="absolute right-0 top-2 h-[26px] w-10 rounded-full bg-white shadow-[0_4px_10px_rgba(90,80,160,0.22)]" />
      <div className="absolute right-[26px] top-0 h-[26px] w-[26px] rounded-tl-full rounded-tr-full rounded-bl-full rounded-br-[4px] bg-[#2FA9F5]" />
      <div className="absolute right-10 top-2 h-[5px] w-[5px] rounded-full bg-[#0B3F6B]" />
      <div
        className="absolute right-[30px] top-[-4px] h-2 w-1 rounded-[3px] bg-[#2FA9F5]"
        style={{ transform: "rotate(-20deg)" }}
      />
      <div
        className="absolute right-10 top-[-4px] h-2 w-1 rounded-[3px] bg-[#2FA9F5]"
        style={{ transform: "rotate(20deg)" }}
      />
    </div>
  );
}
