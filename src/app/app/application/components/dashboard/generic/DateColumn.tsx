// small component to put both submitted date and expiry date in a single column

type props={
    submittedDate: string;// when was application last submitted
    lastUpdated?: string;// when was the application last updated
}
export default function DateColumn({ submittedDate, lastUpdated }: props) {
    const showUpdate = lastUpdated && lastUpdated !== submittedDate;// only show the last updated row if 
    // it exists and it is actually different than the submitted date
    return (
      <div className="flex flex-col items-end gap-0.5 shrink-0 text-[11px] text-white/25 text-right leading-snug">
        <span>Submitted {submittedDate}</span>
        {showUpdate && <span>Updated {lastUpdated}</span>}
      </div>
    );
  }
  