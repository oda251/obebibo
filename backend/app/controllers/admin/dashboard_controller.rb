class Admin::DashboardController < Admin::ApplicationController
  def index
    @campaigns_count = Campaign.count
    @active_campaigns_count = Campaign.active_campaigns.count
    @entries_count = Entry.count
    @reviews_count = Review.count
    @recent_entries = Entry.recent.includes(:user, :campaign).limit(5)
    @recent_reviews = Review.recent.includes(:user, :campaign).limit(5)
  end
end