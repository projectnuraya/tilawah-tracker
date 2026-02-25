import { landingCopy } from './copy'

export function buildMailtoLink() {
	const { email, subject, body } = landingCopy.hero.mailto
	const params = new URLSearchParams({ subject, body })
	return `mailto:${email}?${params.toString()}`
}
