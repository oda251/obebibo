class CampaignsController < ApplicationController
  def index
    @campaigns = Campaign.active_campaigns.current.recent.page(params[:page]).per(20)
    @recommended_campaigns = Campaign.active_campaigns.current.limit(3)
  end

  def show
    @campaign = Campaign.find(params[:id])
    @reviews = @campaign.reviews.recent.page(params[:page]).per(10)
    @user_entry = current_user&.entries&.find_by(campaign: @campaign)
    @can_apply = user_signed_in? && !@user_entry && @campaign.application_period?
  end
end