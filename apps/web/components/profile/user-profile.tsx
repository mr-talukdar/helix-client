'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Trophy, Zap, Settings } from 'lucide-react'
import { WorkoutHeader } from '@/components/workout/workout-header'

interface UserProfile {
  name: string
  email: string
  age: number
  weight: number
  height: string
  goal: string
  experience: string
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfile | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('helix-profile')
    if (saved) {
      const data = JSON.parse(saved)
      setProfile(data)
      setFormData(data)
    } else {
      const initial: UserProfile = {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        age: 28,
        weight: 185,
        height: "5'10\"",
        goal: 'Build Strength',
        experience: 'Intermediate',
      }
      setProfile(initial)
      setFormData(initial)
      localStorage.setItem('helix-profile', JSON.stringify(initial))
    }
  }, [])

  const handleSave = () => {
    if (formData) {
      setProfile(formData)
      localStorage.setItem('helix-profile', JSON.stringify(formData))
      setIsEditing(false)
    }
  }

  if (!profile || !formData) return null

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl">
        <WorkoutHeader
          title="Profile"
          subtitle="Manage your account and preferences"
        />

        {/* Profile Card */}
        <Card className="bg-card border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-secondary rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Age</p>
              <p className="text-lg font-bold text-foreground">{profile.age}</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Weight</p>
              <p className="text-lg font-bold text-foreground">{profile.weight}</p>
              <p className="text-xs text-muted-foreground">lbs</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Height</p>
              <p className="text-lg font-bold text-foreground">{profile.height}</p>
            </div>
          </div>
        </Card>

        {/* Edit Mode */}
        {isEditing && (
          <Card className="bg-card border-border p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Age</label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Weight (lbs)</label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Height</label>
                  <Input
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Goals Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Your Goals
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Primary Goal</p>
              <p className="text-foreground font-medium">{profile.goal}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Experience Level</p>
              <p className="text-foreground font-medium">{profile.experience}</p>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-secondary rounded-lg text-center border-2 border-primary">
              <p className="text-2xl font-bold text-primary mb-1">12</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground mb-1">50+</p>
              <p className="text-xs text-muted-foreground">Total Workouts</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground mb-1">3</p>
              <p className="text-xs text-muted-foreground">New PRs</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground mb-1">30+</p>
              <p className="text-xs text-muted-foreground">lbs Gained</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
