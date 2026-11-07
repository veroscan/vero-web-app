import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/ui/CtaBand";

export function LaunchUpdates() {
  return (
    <CtaBand heading="Not ready to talk? Get launch updates." eyebrow="Launch updates">
      <form
        className="pb-inline"
        id="updates-form"
        action="#"
        method="post"
        noValidate
        data-vero-form="subscribe"
        data-sent="You are on the list. We will be in touch before launch."
        data-offline="This form is not connected yet, so nothing was sent. Please email us and we will add you by hand."
      >
        <div className="hp" aria-hidden="true">
          <label>
            Leave this empty if you are a person
            <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="field" data-req="email">
          <label htmlFor="u-email">Email</label>
          <input id="u-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="Enter your email for updates" required aria-describedby="u-email-e" />
          <p className="fld-err" id="u-email-e" role="alert" hidden></p>
        </div>
        <Button variant="green" type="submit">Subscribe</Button>
        <div className="form-out" role="status" aria-live="polite"></div>
      </form>
    </CtaBand>
  );
}
