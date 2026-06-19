import NewsletterFormBase from './renderer/NewsletterForm'

export default function NewsletterForm({ buttonLabel = 'Subscribe' }: { buttonLabel?: string }) {
  return <NewsletterFormBase buttonLabel={buttonLabel} />
}
