'use client'

import { useEffect, useState } from 'react'

/**
 * Fetches a group's name for breadcrumbs and back-button labels on client-rendered pages that
 * only receive a groupId from the route. Returns null until it resolves, so callers should fall
 * back to a generic label rather than rendering an empty crumb.
 */
export function useGroupName(groupId: string | null): string | null {
	const [name, setName] = useState<string | null>(null)

	useEffect(() => {
		if (!groupId) return
		let cancelled = false

		fetch(`/api/v1/groups/${groupId}`)
			.then((res) => res.json())
			.then((data) => {
				if (!cancelled && data?.success) setName(data.data.name)
			})
			.catch(() => {
				// A missing name only degrades the crumb to a generic label, so failing quietly is fine.
			})

		return () => {
			cancelled = true
		}
	}, [groupId])

	return name
}
