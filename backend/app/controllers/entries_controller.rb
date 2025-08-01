class EntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_campaign

  def new
    redirect_to campaign_path(@campaign), alert: '既に応募済みです' if already_applied?
    redirect_to campaign_path(@campaign), alert: '応募期間外です' unless @campaign.application_period?
    
    @entry = @campaign.entries.build
  end

  def create
    redirect_to campaign_path(@campaign), alert: '既に応募済みです' if already_applied?
    redirect_to campaign_path(@campaign), alert: '応募期間外です' unless @campaign.application_period?

    @entry = @campaign.entries.build(user: current_user)
    
    if @entry.save
      redirect_to entry_done_campaign_path(@campaign), notice: '応募が完了しました'
    else
      render :new, alert: '応募に失敗しました'
    end
  end

  def done
    @entry = current_user.entries.find_by(campaign: @campaign)
    redirect_to campaign_path(@campaign) unless @entry
  end

  private

  def set_campaign
    @campaign = Campaign.find(params[:id])
  end

  def already_applied?
    current_user.entries.exists?(campaign: @campaign)
  end
end