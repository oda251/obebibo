class CompanySns < ApplicationRecord
  belongs_to :company

  validates :sns_type, presence: true, inclusion: { 
    in: %w[twitter facebook instagram tiktok youtube line], 
    message: "%{value} is not a valid SNS type" 
  }
  validates :sns_url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp }

  enum sns_type: {
    twitter: 'twitter',
    facebook: 'facebook',
    instagram: 'instagram',
    tiktok: 'tiktok',
    youtube: 'youtube',
    line: 'line'
  }
end